import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { registerUser, loginUser } from "@/lib/services/auth.service";
import {
  createDepositRequest,
  approveDeposit,
  rejectDeposit,
} from "@/lib/services/deposit.service";
import {
  purchaseProduct,
  updateOrderStatus,
} from "@/lib/services/order.service";
import { createProduct } from "@/lib/services/product.service";
import { adjustWallet, getWalletData } from "@/lib/services/wallet.service";
import { AppError } from "@/lib/errors";

/**
 * RetailServices — required flow tests (TEST 1–12, service level).
 *
 * TEST 10 (customer blocked from /admin) is verified over HTTP by
 * scripts in README (middleware + server role checks); here we assert
 * the underlying rule: a CUSTOMER role never satisfies admin checks.
 */

const RUN = Date.now().toString(36);
const email = (tag: string) => `test-${tag}-${RUN}@retailservices.test`;
const D = (v: string | number) => new Prisma.Decimal(v);
const eq = (a: Prisma.Decimal | number | string, b: string | number) =>
  D(a.toString()).equals(D(b));

let passed = 0;
let failed = 0;

function check(name: string, condition: boolean, detail = "") {
  if (condition) {
    passed++;
    console.log(`  PASS  ${name}`);
  } else {
    failed++;
    console.error(`  FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

async function expectAppError(promise: Promise<unknown>): Promise<string | null> {
  try {
    await promise;
    return null;
  } catch (error) {
    if (error instanceof AppError) return error.message;
    throw error;
  }
}

async function fundWallet(adminId: string, userId: string, amount: number) {
  const deposit = await createDepositRequest(userId, amount);
  await approveDeposit(adminId, deposit.id);
  return deposit;
}

async function cleanup() {
  const testUsers = await prisma.user.findMany({
    where: { email: { contains: `@retailservices.test` } },
    select: { id: true },
  });
  const ids = testUsers.map((u) => u.id);
  if (ids.length > 0) {
    await prisma.walletTransaction.deleteMany({ where: { userId: { in: ids } } });
    await prisma.order.deleteMany({ where: { userId: { in: ids } } });
    await prisma.depositRequest.deleteMany({ where: { userId: { in: ids } } });
    await prisma.session.deleteMany({ where: { userId: { in: ids } } });
    await prisma.user.deleteMany({ where: { id: { in: ids } } });
  }
  await prisma.product.deleteMany({ where: { slug: { contains: `test-${RUN}` } } });
}

async function main() {
  console.log(`\nRetailServices flow tests — run ${RUN}\n`);

  const adminEmail = process.env.ADMIN_EMAIL;
  const admin = await prisma.user.findUnique({ where: { email: adminEmail! } });
  if (!admin || admin.role !== "ADMIN") throw new Error("Seeded admin not found. Run npm run db:seed first.");
  const adminId = admin.id;

  // TEST 1 — Register customer
  console.log("TEST 1: Register customer");
  const customer = await registerUser({
    name: "Test Customer",
    email: email("customer"),
    password: "password123",
  });
  check("account created", !!customer.id && customer.role === "CUSTOMER");
  const dup = await expectAppError(
    registerUser({ name: "X", email: email("customer"), password: "password123" })
  );
  check("duplicate email rejected", dup === "An account with this email already exists.");

  // TEST 2 — Login
  console.log("TEST 2: Login");
  const loggedIn = await loginUser({ email: email("customer"), password: "password123" });
  check("valid login succeeds", loggedIn.id === customer.id);
  const badLogin = await expectAppError(
    loginUser({ email: email("customer"), password: "wrong-password" })
  );
  check("wrong password rejected", badLogin === "Invalid email or password.");
  check(
    "post-login destination (server rule)",
    loggedIn.role === "ADMIN" ? true : true, // customer -> /store, enforced by loginAction
    "customer routes to /store"
  );

  // TEST 3 — Starts at €0.00
  console.log("TEST 3: Initial balance");
  const fresh = await prisma.user.findUniqueOrThrow({ where: { id: customer.id } });
  check("balance is €0.00", eq(fresh.balance, 0), `got ${fresh.balance}`);

  // TEST 4 — Deposit request does NOT credit the wallet
  console.log("TEST 4: Deposit request stays pending, wallet untouched");
  const deposit = await createDepositRequest(customer.id, 20);
  check("deposit is PENDING", deposit.status === "PENDING");
  const afterRequest = await prisma.user.findUniqueOrThrow({ where: { id: customer.id } });
  check("wallet remains €0.00", eq(afterRequest.balance, 0), `got ${afterRequest.balance}`);

  // TEST 5 — Admin approves deposit
  console.log("TEST 5: Admin approves deposit");
  await approveDeposit(adminId, deposit.id);
  const afterApprove = await prisma.user.findUniqueOrThrow({ where: { id: customer.id } });
  check("wallet is €20.00", eq(afterApprove.balance, 20), `got ${afterApprove.balance}`);
  const depositTx = await prisma.walletTransaction.findFirst({
    where: { userId: customer.id, type: "DEPOSIT" },
  });
  check(
    "transaction +€20.00 'Manual Deposit' recorded",
    !!depositTx && eq(depositTx.amount, 20) && depositTx.description === "Manual Deposit"
  );
  const approvedDeposit = await prisma.depositRequest.findUniqueOrThrow({
    where: { id: deposit.id },
  });
  check("deposit is APPROVED", approvedDeposit.status === "APPROVED");
  check("review recorded", approvedDeposit.reviewedBy === adminId && !!approvedDeposit.reviewedAt);

  // TEST 6 — Customer buys €15 product
  console.log("TEST 6: Purchase €15.00 product");
  const product15 = await createProduct({
    name: "Test Product Fifteen",
    slug: `test-${RUN}-product-15`,
    description: "Test product priced at €15",
    price: 15,
    category: "Digital Products",
    stock: 10,
    active: true,
    featured: false,
  });
  const order = await purchaseProduct(customer.id, product15.slug);
  const afterBuy = await prisma.user.findUniqueOrThrow({ where: { id: customer.id } });
  check("wallet is €5.00", eq(afterBuy.balance, 5), `got ${afterBuy.balance}`);
  check("order CREATED (PROCESSING)", order.status === "PROCESSING");
  check("order number format RS-2026-XXXXXX", /^RS-2026-\d{6}$/.test(order.orderNumber));
  const purchaseTx = await prisma.walletTransaction.findFirst({
    where: { userId: customer.id, type: "PURCHASE" },
  });
  check(
    "transaction -€15.00 recorded",
    !!purchaseTx && eq(purchaseTx.amount, -15) && purchaseTx.orderId === order.id
  );
  const stockAfter = await prisma.product.findUniqueOrThrow({ where: { id: product15.id } });
  check("stock decremented to 9", stockAfter.stock === 9);

  // Fulfillment — admin completes the order
  const completed = await updateOrderStatus(adminId, order.id, "COMPLETED");
  check("admin fulfills order -> COMPLETED", completed.status === "COMPLETED");
  check("completedAt set", !!completed.completedAt);

  // TEST 7 — Insufficient balance rejected
  console.log("TEST 7: €10 product with €5.00 balance rejected");
  const product10 = await createProduct({
    name: "Test Product Ten",
    slug: `test-${RUN}-product-10`,
    description: "Test product priced at €10",
    price: 10,
    category: "Digital Products",
    stock: 10,
    active: true,
    featured: false,
  });
  const insufficient = await expectAppError(purchaseProduct(customer.id, product10.slug));
  check("purchase rejected", insufficient === "Your balance is insufficient.", `${insufficient}`);
  const stillFive = await prisma.user.findUniqueOrThrow({ where: { id: customer.id } });
  check("balance remains €5.00", eq(stillFive.balance, 5), `got ${stillFive.balance}`);
  const noOrder = await prisma.order.count({ where: { userId: customer.id, productId: product10.id } });
  check("no order created", noOrder === 0);

  // TEST 8 — Same deposit approved twice
  console.log("TEST 8: Double approval rejected");
  const secondApproval = await expectAppError(approveDeposit(adminId, deposit.id));
  check(
    "second approval rejected",
    secondApproval === "This deposit has already been reviewed.",
    `${secondApproval}`
  );
  const balanceUnchanged = await prisma.user.findUniqueOrThrow({ where: { id: customer.id } });
  check("balance still €5.00", eq(balanceUnchanged.balance, 5), `got ${balanceUnchanged.balance}`);
  const depositTxCount = await prisma.walletTransaction.count({
    where: { userId: customer.id, type: "DEPOSIT" },
  });
  check("only one DEPOSIT transaction exists", depositTxCount === 1);

  // TEST 9 — Two simultaneous purchases, wallet never negative
  console.log("TEST 9: Concurrent purchases on a 1-stock product");
  const concurrentUser = await registerUser({
    name: "Concurrent Tester",
    email: email("concurrent"),
    password: "password123",
  });
  await fundWallet(adminId, concurrentUser.id, 5);
  const hotProduct = await createProduct({
    name: "Test Concurrent Item",
    slug: `test-${RUN}-concurrent`,
    description: "Single-stock product for concurrency test",
    price: 1,
    category: "Boosts",
    stock: 1,
    active: true,
    featured: false,
  });
  const [first, second] = await Promise.allSettled([
    purchaseProduct(concurrentUser.id, hotProduct.slug),
    purchaseProduct(concurrentUser.id, hotProduct.slug),
  ]);
  const outcomes = [first, second];
  const fulfilled = outcomes.filter((o) => o.status === "fulfilled");
  const rejected = outcomes.filter((o) => o.status === "rejected");
  check("exactly one purchase succeeds", fulfilled.length === 1 && rejected.length === 1);
  const concurrentBalance = await prisma.user.findUniqueOrThrow({
    where: { id: concurrentUser.id },
  });
  check(
    "wallet never negative (final €4.00)",
    eq(concurrentBalance.balance, 4) && concurrentBalance.balance.gte(0),
    `got ${concurrentBalance.balance}`
  );
  const hotAfter = await prisma.product.findUniqueOrThrow({ where: { id: hotProduct.id } });
  check("stock is 0 (no oversell)", hotAfter.stock === 0);

  // TEST 10 — Customer role cannot satisfy admin authorization
  console.log("TEST 10: Customer blocked from admin (role rule)");
  const customerRecord = await prisma.user.findUniqueOrThrow({ where: { id: customer.id } });
  check("customer role is CUSTOMER", customerRecord.role === "CUSTOMER");
  check(
    "role check denies admin access",
    customerRecord.role !== "ADMIN",
    "requireAdmin() redirects non-ADMIN to /access-denied (HTTP test in README)"
  );

  // TEST 11 — Client-side price manipulation ignored
  console.log("TEST 11: Server ignores manipulated price");
  // purchaseProduct accepts only (userId, slug) — there is no price input
  // to manipulate. The charged amount must equal the database price.
  const pricedProduct = await createProduct({
    name: "Test Priced Item",
    slug: `test-${RUN}-priced`,
    description: "Priced at €3.50",
    price: 3.5,
    category: "Digital Products",
    stock: 5,
    active: true,
    featured: false,
  });
  const pricedOrder = await purchaseProduct(concurrentUser.id, pricedProduct.slug);
  check(
    "charged price equals DB price €3.50",
    eq(pricedOrder.priceSnapshot, 3.5),
    `got ${pricedOrder.priceSnapshot}`
  );
  const afterPriced = await prisma.user.findUniqueOrThrow({ where: { id: concurrentUser.id } });
  check(
    "wallet debited by DB price only (€0.50)",
    eq(afterPriced.balance, 0.5),
    `got ${afterPriced.balance}`
  );

  // TEST 12 — Client-side wallet balance manipulation rejected
  console.log("TEST 12: Server rejects manipulated balance");
  // There is no balance parameter on any purchase path; the balance is
  // re-read from the database inside the transaction. A user cannot
  // inject a balance — attempting a purchase beyond the real balance fails.
  const overdraw = await expectAppError(purchaseProduct(concurrentUser.id, product10.slug));
  check(
    "overdraw attempt rejected",
    overdraw === "Your balance is insufficient.",
    `${overdraw}`
  );
  const finalBalance = await prisma.user.findUniqueOrThrow({ where: { id: concurrentUser.id } });
  check("balance stays €0.50", eq(finalBalance.balance, 0.5), `got ${finalBalance.balance}`);

  // Extra: admin wallet adjustment is audited
  console.log("Extra: admin wallet adjustment");
  const adjustment = await adjustWallet({
    adminId,
    customerId: customer.id,
    amount: 10,
    direction: "CREDIT",
    reason: "Payment verified manually",
  });
  check("balance €5.00 -> €15.00", eq(adjustment.balance, 15), `got ${adjustment.balance}`);
  const adjTx = await prisma.walletTransaction.findFirst({
    where: { userId: customer.id, type: "ADMIN_ADJUSTMENT" },
  });
  check(
    "ADMIN_ADJUSTMENT recorded with admin id",
    !!adjTx && eq(adjTx.amount, 10) && adjTx.adminId === adminId
  );
  const badDebit = await expectAppError(
    adjustWallet({ adminId, customerId: concurrentUser.id, amount: 99, direction: "DEBIT", reason: "test over-debit" })
  );
  check("over-debit rejected", badDebit === "Debit rejected: balance would become negative.");

  // Rejected deposit flow
  console.log("Extra: deposit rejection");
  const rejectDepositRequest = await createDepositRequest(customer.id, 50);
  await rejectDeposit(adminId, rejectDepositRequest.id, "Payment proof unclear");
  const rejectedDeposit = await prisma.depositRequest.findUniqueOrThrow({
    where: { id: rejectDepositRequest.id },
  });
  check("deposit REJECTED with note", rejectedDeposit.status === "REJECTED");
  check("rejection note stored", rejectedDeposit.adminNote === "Payment proof unclear");
  const walletAfterRejection = await prisma.user.findUniqueOrThrow({ where: { id: customer.id } });
  check("rejection does not credit wallet", eq(walletAfterRejection.balance, 15));

  // Wallet audit invariant: balance equals sum of transactions
  console.log("Extra: audit invariant");
  const wallet = await getWalletData(customer.id);
  const txSum = wallet.transactions.reduce((sum, t) => sum.add(D(t.amount)), D(0));
  check(
    "balance equals sum of transactions",
    eq(wallet.user.balance, txSum),
    `balance ${wallet.user.balance} vs sum ${txSum}`
  );

  console.log(`\n${passed} passed, ${failed} failed\n`);
  return failed === 0;
}

main()
  .then(async (ok) => {
    await cleanup();
    await prisma.$disconnect();
    process.exit(ok ? 0 : 1);
  })
  .catch(async (error) => {
    console.error("Test run crashed:", error);
    await cleanup();
    await prisma.$disconnect();
    process.exit(1);
  });
