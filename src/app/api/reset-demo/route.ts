import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const SECRET = process.env.DEMO_RESET_SECRET ?? "onepot-reset";

function d(dateStr: string): Date {
  return new Date(dateStr + "T12:00:00Z");
}

export async function POST(req: NextRequest) {
  const { secret } = await req.json().catch(() => ({}));
  if (secret !== SECRET) {
    return NextResponse.json({ message: "Invalid secret." }, { status: 403 });
  }
  return runSeed();
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== SECRET) {
    return NextResponse.json({ message: "Invalid secret." }, { status: 403 });
  }
  return runSeed();
}

async function runSeed() {
  // Clear in FK order
  await prisma.potContribution.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.potMember.deleteMany();
  await prisma.pot.deleteMany();
  await prisma.user.deleteMany();

  const hash = await bcrypt.hash("OnePot2026", 10);

  // Create 5 users
  const [alice, bob, charlie, diana, evan] = await Promise.all([
    prisma.user.create({
      data: {
        name: "Alice Johnson",
        email: "alice@onepot.com",
        passwordHash: hash,
        isVerified: true,
        balance: 3542.18,
        accountNumber: "10001001",
        sortCode: "30-00-01",
      },
    }),
    prisma.user.create({
      data: {
        name: "Bob Smith",
        email: "bob@onepot.com",
        passwordHash: hash,
        isVerified: true,
        balance: 1823.45,
        accountNumber: "10001002",
        sortCode: "30-00-01",
      },
    }),
    prisma.user.create({
      data: {
        name: "Charlie Brown",
        email: "charlie@onepot.com",
        passwordHash: hash,
        isVerified: true,
        balance: 4901.30,
        accountNumber: "10001003",
        sortCode: "30-00-01",
      },
    }),
    prisma.user.create({
      data: {
        name: "Diana Prince",
        email: "diana@onepot.com",
        passwordHash: hash,
        isVerified: true,
        balance: 6218.77,
        accountNumber: "10001004",
        sortCode: "30-00-01",
      },
    }),
    prisma.user.create({
      data: {
        name: "Evan Williams",
        email: "evan@onepot.com",
        passwordHash: hash,
        isVerified: true,
        balance: 2156.90,
        accountNumber: "10001005",
        sortCode: "30-00-01",
      },
    }),
  ]);

  // Create pots
  const rentPot = await prisma.pot.create({
    data: {
      title: "House Rent — April",
      description: "Shared rent for 14 Clifton Road. Due 1st each month.",
      target: 1800,
      creatorId: alice.id,
      members: {
        create: [{ userId: alice.id }, { userId: bob.id }, { userId: charlie.id }],
      },
    },
  });

  const ibizaPot = await prisma.pot.create({
    data: {
      title: "Ibiza 2026 ✈️",
      description: "Summer holiday fund. Target: flights + hotel.",
      target: 1500,
      creatorId: diana.id,
      members: { create: [{ userId: diana.id }] },
    },
  });

  const macbookPot = await prisma.pot.create({
    data: {
      title: "MacBook Pro",
      description: "Saving up for the new M4 MacBook Pro.",
      target: 2000,
      creatorId: evan.id,
      members: { create: [{ userId: evan.id }] },
    },
  });

  // Pot contributions
  await prisma.potContribution.createMany({
    data: [
      { userId: alice.id, potId: rentPot.id, amount: 600, note: "April share" },
      { userId: bob.id, potId: rentPot.id, amount: 600, note: "April share" },
      { userId: charlie.id, potId: rentPot.id, amount: 600, note: "April share" },
      { userId: diana.id, potId: ibizaPot.id, amount: 450, note: "Initial deposit" },
      { userId: evan.id, potId: macbookPot.id, amount: 300, note: "First payment" },
    ],
  });

  // Transactions — Alice
  await prisma.transaction.createMany({
    data: [
      { userId: alice.id, type: "CREDIT", category: "INCOME",        amount: 3200.00, description: "Monthly Salary",       counterparty: "Techflow Ltd",              reference: "BACS SALARY APR26",  createdAt: d("2026-03-28") },
      { userId: alice.id, type: "DEBIT",  category: "BILLS",         amount: 145.00,  description: "Council Tax",           counterparty: "Bournemouth City Council",  reference: "COUNCIL TAX APR26", createdAt: d("2026-04-01") },
      { userId: alice.id, type: "DEBIT",  category: "TRANSPORT",     amount: 4.80,    description: "TfL Contactless",       counterparty: "Transport for London",      reference: "TFL CONTACTLESS",   createdAt: d("2026-04-02") },
      { userId: alice.id, type: "DEBIT",  category: "ENTERTAINMENT", amount: 17.99,   description: "Netflix",               counterparty: "Netflix International",     reference: "NETFLIX.COM",       createdAt: d("2026-04-03") },
      { userId: alice.id, type: "DEBIT",  category: "GROCERIES",     amount: 54.60,   description: "Sainsbury's",           counterparty: "J Sainsbury PLC",           reference: "SAINSBURYS",        createdAt: d("2026-04-04") },
      { userId: alice.id, type: "DEBIT",  category: "POT_CONTRIBUTION", amount: 600.00, description: "Pot: House Rent — April", counterparty: "OnePot Shared Pot",    reference: "POT-HOUSE-RENT",    createdAt: d("2026-04-05") },
      { userId: alice.id, type: "DEBIT",  category: "EATING_OUT",    amount: 5.45,    description: "Starbucks",             counterparty: "Starbucks UK",              reference: "STARBUCKS",         createdAt: d("2026-04-07") },
      { userId: alice.id, type: "DEBIT",  category: "SHOPPING",      amount: 34.99,   description: "Amazon",                counterparty: "Amazon UK",                 reference: "AMZ*ORDER",         createdAt: d("2026-04-08") },
      { userId: alice.id, type: "DEBIT",  category: "ENTERTAINMENT", amount: 11.99,   description: "Spotify",               counterparty: "Spotify Ltd",               reference: "SPOTIFY",           createdAt: d("2026-04-10") },
      { userId: alice.id, type: "DEBIT",  category: "BILLS",         amount: 45.00,   description: "PureGym",               counterparty: "PureGym Ltd",               reference: "PUREGYM MONTHLY",   createdAt: d("2026-04-11") },
      { userId: alice.id, type: "DEBIT",  category: "GROCERIES",     amount: 43.20,   description: "Waitrose",              counterparty: "Waitrose Ltd",              reference: "WAITROSE",          createdAt: d("2026-04-14") },
      { userId: alice.id, type: "DEBIT",  category: "TRANSPORT",     amount: 3.60,    description: "TfL Contactless",       counterparty: "Transport for London",      reference: "TFL CONTACTLESS",   createdAt: d("2026-04-15") },
      { userId: alice.id, type: "DEBIT",  category: "EATING_OUT",    amount: 8.10,    description: "Pret A Manger",         counterparty: "Pret A Manger (Europe)",    reference: "PRET A MANGER",     createdAt: d("2026-04-16") },
      { userId: alice.id, type: "DEBIT",  category: "EATING_OUT",    amount: 28.50,   description: "Deliveroo",             counterparty: "Deliveroo UK Ltd",          reference: "DELIVEROO",         createdAt: d("2026-04-18") },
      { userId: alice.id, type: "DEBIT",  category: "SHOPPING",      amount: 89.99,   description: "ASOS",                  counterparty: "ASOS PLC",                  reference: "ASOS.COM",          createdAt: d("2026-04-19") },
      { userId: alice.id, type: "CREDIT", category: "INCOME",        amount: 500.00,  description: "Freelance Payment",     counterparty: "Design Studio Co",          reference: "FASTER PMT",        createdAt: d("2026-04-20") },
      { userId: alice.id, type: "DEBIT",  category: "BILLS",         amount: 87.00,   description: "Octopus Energy",        counterparty: "Octopus Energy Ltd",        reference: "OCTOPUS ENERGY",    createdAt: d("2026-04-22") },
      { userId: alice.id, type: "DEBIT",  category: "EATING_OUT",    amount: 32.40,   description: "Nando's",               counterparty: "Nando's Chickenland Ltd",   reference: "NANDOS",            createdAt: d("2026-04-24") },
      { userId: alice.id, type: "DEBIT",  category: "TRANSPORT",     amount: 11.20,   description: "Uber",                  counterparty: "Uber BV",                   reference: "UBER* TRIP",        createdAt: d("2026-04-25") },
      { userId: alice.id, type: "DEBIT",  category: "GROCERIES",     amount: 22.30,   description: "Tesco Express",         counterparty: "Tesco Stores Ltd",          reference: "TESCO*EXPRESS",     createdAt: d("2026-04-27") },
    ],
  });

  // Transactions — Bob
  await prisma.transaction.createMany({
    data: [
      { userId: bob.id, type: "CREDIT", category: "INCOME",           amount: 2400.00, description: "Monthly Salary",      counterparty: "Creative Agency Ltd",      reference: "BACS SALARY APR26", createdAt: d("2026-03-31") },
      { userId: bob.id, type: "DEBIT",  category: "POT_CONTRIBUTION", amount: 600.00,  description: "Pot: House Rent — April", counterparty: "OnePot Shared Pot",  reference: "POT-HOUSE-RENT",    createdAt: d("2026-04-05") },
      { userId: bob.id, type: "DEBIT",  category: "GROCERIES",        amount: 28.45,   description: "Tesco Express",       counterparty: "Tesco Stores Ltd",         reference: "TESCO*EXPRESS",     createdAt: d("2026-04-06") },
      { userId: bob.id, type: "DEBIT",  category: "EATING_OUT",       amount: 7.49,    description: "McDonald's",          counterparty: "McDonald's UK",            reference: "MCDONALDS",         createdAt: d("2026-04-07") },
      { userId: bob.id, type: "DEBIT",  category: "ENTERTAINMENT",    amount: 8.99,    description: "Amazon Prime",        counterparty: "Amazon UK",                reference: "AMAZON PRIME",      createdAt: d("2026-04-08") },
      { userId: bob.id, type: "DEBIT",  category: "TRANSPORT",        amount: 28.50,   description: "National Rail",       counterparty: "National Rail",            reference: "NATL RAIL TICKET",  createdAt: d("2026-04-09") },
      { userId: bob.id, type: "DEBIT",  category: "GROCERIES",        amount: 42.18,   description: "Lidl",                counterparty: "Lidl GB",                  reference: "LIDL GB",           createdAt: d("2026-04-11") },
      { userId: bob.id, type: "DEBIT",  category: "EATING_OUT",       amount: 4.75,    description: "Costa Coffee",        counterparty: "Costa Ltd",                reference: "COSTA COFFEE",      createdAt: d("2026-04-13") },
      { userId: bob.id, type: "CREDIT", category: "INCOME",           amount: 750.00,  description: "Freelance Invoice",   counterparty: "Media Productions Inc",    reference: "CLIENT INV 47",     createdAt: d("2026-04-15") },
      { userId: bob.id, type: "DEBIT",  category: "SHOPPING",         amount: 18.90,   description: "Boots",               counterparty: "Boots UK Ltd",             reference: "BOOTS STORE",       createdAt: d("2026-04-16") },
      { userId: bob.id, type: "DEBIT",  category: "EATING_OUT",       amount: 19.50,   description: "Uber Eats",           counterparty: "Uber BV",                  reference: "UBEREATS",          createdAt: d("2026-04-18") },
      { userId: bob.id, type: "DEBIT",  category: "ENTERTAINMENT",    amount: 4.99,    description: "Disney+",             counterparty: "Disney Streaming Ltd",     reference: "DISNEYPLUS",        createdAt: d("2026-04-19") },
      { userId: bob.id, type: "DEBIT",  category: "BILLS",            amount: 34.00,   description: "Wessex Water",        counterparty: "Wessex Water Services Ltd",reference: "WESSEX WATER",      createdAt: d("2026-04-20") },
      { userId: bob.id, type: "DEBIT",  category: "GROCERIES",        amount: 35.60,   description: "Aldi",                counterparty: "Aldi Stores Ltd",          reference: "ALDI GB",           createdAt: d("2026-04-23") },
      { userId: bob.id, type: "DEBIT",  category: "EATING_OUT",       amount: 6.80,    description: "Pret A Manger",       counterparty: "Pret A Manger (Europe)",   reference: "PRET A MANGER",     createdAt: d("2026-04-25") },
      { userId: bob.id, type: "DEBIT",  category: "BILLS",            amount: 47.99,   description: "BT Broadband",        counterparty: "BT Group PLC",             reference: "BT GROUP",          createdAt: d("2026-04-26") },
      { userId: bob.id, type: "DEBIT",  category: "SHOPPING",         amount: 45.00,   description: "H&M",                 counterparty: "H & M Hennes & Mauritz UK",reference: "H&M STORE",         createdAt: d("2026-04-27") },
      { userId: bob.id, type: "DEBIT",  category: "TRANSPORT",        amount: 5.60,    description: "TfL Contactless",     counterparty: "Transport for London",     reference: "TFL CONTACTLESS",   createdAt: d("2026-04-28") },
    ],
  });

  // Transactions — Charlie
  await prisma.transaction.createMany({
    data: [
      { userId: charlie.id, type: "CREDIT", category: "INCOME",           amount: 4800.00, description: "Monthly Salary",    counterparty: "Global Tech Corp",         reference: "BACS SALARY APR26", createdAt: d("2026-03-31") },
      { userId: charlie.id, type: "DEBIT",  category: "BILLS",            amount: 145.00,  description: "Council Tax",       counterparty: "Bournemouth City Council", reference: "COUNCIL TAX APR26", createdAt: d("2026-04-01") },
      { userId: charlie.id, type: "DEBIT",  category: "GROCERIES",        amount: 96.40,   description: "Ocado",             counterparty: "Ocado Group",              reference: "OCADO",             createdAt: d("2026-04-03") },
      { userId: charlie.id, type: "DEBIT",  category: "TRANSPORT",        amount: 6.40,    description: "TfL Contactless",   counterparty: "Transport for London",     reference: "TFL CONTACTLESS",   createdAt: d("2026-04-04") },
      { userId: charlie.id, type: "DEBIT",  category: "POT_CONTRIBUTION", amount: 600.00,  description: "Pot: House Rent — April", counterparty: "OnePot Shared Pot", reference: "POT-HOUSE-RENT",    createdAt: d("2026-04-05") },
      { userId: charlie.id, type: "DEBIT",  category: "BILLS",            amount: 2.99,    description: "Apple iCloud",      counterparty: "Apple Inc",                reference: "APPLE.COM/BILL",    createdAt: d("2026-04-08") },
      { userId: charlie.id, type: "DEBIT",  category: "ENTERTAINMENT",    amount: 11.99,   description: "Spotify",           counterparty: "Spotify Ltd",              reference: "SPOTIFY",           createdAt: d("2026-04-08") },
      { userId: charlie.id, type: "DEBIT",  category: "EATING_OUT",       amount: 48.50,   description: "Sushi Circle",      counterparty: "Sushi Circle Ltd",         reference: "SUSHI CIRCLE",      createdAt: d("2026-04-10") },
      { userId: charlie.id, type: "DEBIT",  category: "BILLS",            amount: 60.00,   description: "Gym Membership",    counterparty: "Third Space Ltd",          reference: "THIRD SPACE GYM",   createdAt: d("2026-04-12") },
      { userId: charlie.id, type: "DEBIT",  category: "SHOPPING",         amount: 124.99,  description: "John Lewis",        counterparty: "John Lewis Partnership",   reference: "JOHN LEWIS",        createdAt: d("2026-04-13") },
      { userId: charlie.id, type: "CREDIT", category: "INCOME",           amount: 1000.00, description: "Salary Bonus",      counterparty: "Global Tech Corp",         reference: "Q1 BONUS",          createdAt: d("2026-04-15") },
      { userId: charlie.id, type: "DEBIT",  category: "GROCERIES",        amount: 67.80,   description: "Waitrose",          counterparty: "Waitrose Ltd",             reference: "WAITROSE",          createdAt: d("2026-04-16") },
      { userId: charlie.id, type: "DEBIT",  category: "TRANSPORT",        amount: 14.50,   description: "Uber",              counterparty: "Uber BV",                  reference: "UBER* TRIP",        createdAt: d("2026-04-17") },
      { userId: charlie.id, type: "DEBIT",  category: "EATING_OUT",       amount: 35.90,   description: "Deliveroo",         counterparty: "Deliveroo UK Ltd",         reference: "DELIVEROO",         createdAt: d("2026-04-19") },
      { userId: charlie.id, type: "DEBIT",  category: "BILLS",            amount: 92.00,   description: "Octopus Energy",    counterparty: "Octopus Energy Ltd",       reference: "OCTOPUS ENERGY",    createdAt: d("2026-04-20") },
      { userId: charlie.id, type: "DEBIT",  category: "ENTERTAINMENT",    amount: 17.99,   description: "Netflix",           counterparty: "Netflix International",    reference: "NETFLIX.COM",       createdAt: d("2026-04-21") },
      { userId: charlie.id, type: "DEBIT",  category: "SHOPPING",         amount: 78.50,   description: "ASOS",              counterparty: "ASOS PLC",                 reference: "ASOS.COM",          createdAt: d("2026-04-22") },
      { userId: charlie.id, type: "DEBIT",  category: "EATING_OUT",       amount: 64.00,   description: "Dishoom",           counterparty: "Dishoom Ltd",              reference: "DISHOOM",           createdAt: d("2026-04-24") },
      { userId: charlie.id, type: "DEBIT",  category: "TRANSPORT",        amount: 42.80,   description: "National Rail",     counterparty: "National Rail",            reference: "NATL RAIL TICKET",  createdAt: d("2026-04-25") },
      { userId: charlie.id, type: "DEBIT",  category: "GROCERIES",        amount: 31.20,   description: "Tesco Express",     counterparty: "Tesco Stores Ltd",         reference: "TESCO*EXPRESS",     createdAt: d("2026-04-27") },
      { userId: charlie.id, type: "DEBIT",  category: "ENTERTAINMENT",    amount: 9.99,    description: "Apple App Store",   counterparty: "Apple Inc",                reference: "APPLE.COM/BILL",    createdAt: d("2026-04-28") },
      { userId: charlie.id, type: "DEBIT",  category: "EATING_OUT",       amount: 5.20,    description: "Costa Coffee",      counterparty: "Costa Ltd",                reference: "COSTA COFFEE",      createdAt: d("2026-04-29") },
    ],
  });

  // Transactions — Diana
  await prisma.transaction.createMany({
    data: [
      { userId: diana.id, type: "CREDIT", category: "INCOME",           amount: 5500.00, description: "Monthly Salary",    counterparty: "Finance Partners LLC",     reference: "BACS SALARY APR26", createdAt: d("2026-03-28") },
      { userId: diana.id, type: "DEBIT",  category: "BILLS",            amount: 145.00,  description: "Council Tax",       counterparty: "Bournemouth City Council", reference: "COUNCIL TAX APR26", createdAt: d("2026-04-01") },
      { userId: diana.id, type: "DEBIT",  category: "GROCERIES",        amount: 84.50,   description: "Marks & Spencer",   counterparty: "Marks & Spencer PLC",      reference: "M&S FOOD",          createdAt: d("2026-04-03") },
      { userId: diana.id, type: "DEBIT",  category: "TRANSPORT",        amount: 6.40,    description: "TfL Contactless",   counterparty: "Transport for London",     reference: "TFL CONTACTLESS",   createdAt: d("2026-04-04") },
      { userId: diana.id, type: "DEBIT",  category: "ENTERTAINMENT",    amount: 8.99,    description: "Amazon Prime",      counterparty: "Amazon UK",                reference: "AMAZON PRIME",      createdAt: d("2026-04-05") },
      { userId: diana.id, type: "DEBIT",  category: "POT_CONTRIBUTION", amount: 450.00,  description: "Pot: Ibiza 2026",   counterparty: "OnePot Savings Pot",       reference: "POT-IBIZA",         createdAt: d("2026-04-06") },
      { userId: diana.id, type: "DEBIT",  category: "EATING_OUT",       amount: 52.00,   description: "Fratellis",         counterparty: "Fratellis Ltd",            reference: "FRATELLIS",         createdAt: d("2026-04-07") },
      { userId: diana.id, type: "DEBIT",  category: "BILLS",            amount: 54.00,   description: "Sky TV",            counterparty: "Sky UK Ltd",               reference: "SKY TV MONTHLY",    createdAt: d("2026-04-08") },
      { userId: diana.id, type: "DEBIT",  category: "SHOPPING",         amount: 189.00,  description: "Selfridges",        counterparty: "Selfridges & Co Ltd",      reference: "SELFRIDGES",        createdAt: d("2026-04-10") },
      { userId: diana.id, type: "DEBIT",  category: "TRANSPORT",        amount: 210.00,  description: "British Airways",   counterparty: "British Airways PLC",      reference: "BA FLIGHTS",        createdAt: d("2026-04-12") },
      { userId: diana.id, type: "CREDIT", category: "INCOME",           amount: 1200.00, description: "Consulting Fee",    counterparty: "Advisory Group Ltd",       reference: "CONSULTING FEE",    createdAt: d("2026-04-14") },
      { userId: diana.id, type: "DEBIT",  category: "GROCERIES",        amount: 127.40,  description: "Ocado",             counterparty: "Ocado Group",              reference: "OCADO",             createdAt: d("2026-04-15") },
      { userId: diana.id, type: "DEBIT",  category: "EATING_OUT",       amount: 78.00,   description: "Chucs Restaurant",  counterparty: "Chucs Ltd",                reference: "CHUCS",             createdAt: d("2026-04-17") },
      { userId: diana.id, type: "DEBIT",  category: "BILLS",            amount: 95.00,   description: "Octopus Energy",    counterparty: "Octopus Energy Ltd",       reference: "OCTOPUS ENERGY",    createdAt: d("2026-04-18") },
      { userId: diana.id, type: "DEBIT",  category: "ENTERTAINMENT",    amount: 11.99,   description: "Spotify Premium",   counterparty: "Spotify Ltd",              reference: "SPOTIFY",           createdAt: d("2026-04-20") },
      { userId: diana.id, type: "DEBIT",  category: "BILLS",            amount: 95.00,   description: "Gym Membership",    counterparty: "Third Space Ltd",          reference: "THIRD SPACE GYM",   createdAt: d("2026-04-21") },
      { userId: diana.id, type: "DEBIT",  category: "SHOPPING",         amount: 145.00,  description: "Reiss",             counterparty: "Reiss Ltd",                reference: "REISS STORE",       createdAt: d("2026-04-23") },
      { userId: diana.id, type: "DEBIT",  category: "EATING_OUT",       amount: 42.50,   description: "Wahaca",            counterparty: "Wahaca Ltd",               reference: "WAHACA",            createdAt: d("2026-04-25") },
      { userId: diana.id, type: "DEBIT",  category: "TRANSPORT",        amount: 56.00,   description: "National Rail",     counterparty: "National Rail",            reference: "NATL RAIL TICKET",  createdAt: d("2026-04-26") },
      { userId: diana.id, type: "DEBIT",  category: "ENTERTAINMENT",    amount: 12.99,   description: "Apple App Store",   counterparty: "Apple Inc",                reference: "APPLE.COM/BILL",    createdAt: d("2026-04-28") },
    ],
  });

  // Transactions — Evan
  await prisma.transaction.createMany({
    data: [
      { userId: evan.id, type: "CREDIT", category: "INCOME",           amount: 2800.00, description: "Monthly Salary",    counterparty: "Startup Hub Ltd",          reference: "BACS SALARY APR26", createdAt: d("2026-03-31") },
      { userId: evan.id, type: "DEBIT",  category: "GROCERIES",        amount: 45.80,   description: "Tesco Express",     counterparty: "Tesco Stores Ltd",         reference: "TESCO*EXPRESS",     createdAt: d("2026-04-02") },
      { userId: evan.id, type: "DEBIT",  category: "POT_CONTRIBUTION", amount: 300.00,  description: "Pot: MacBook Pro",  counterparty: "OnePot Savings Pot",       reference: "POT-MACBOOK",       createdAt: d("2026-04-03") },
      { userId: evan.id, type: "DEBIT",  category: "EATING_OUT",       amount: 8.49,    description: "McDonald's",        counterparty: "McDonald's UK",            reference: "MCDONALDS",         createdAt: d("2026-04-04") },
      { userId: evan.id, type: "DEBIT",  category: "ENTERTAINMENT",    amount: 17.99,   description: "Netflix",           counterparty: "Netflix International",    reference: "NETFLIX.COM",       createdAt: d("2026-04-05") },
      { userId: evan.id, type: "DEBIT",  category: "TRANSPORT",        amount: 4.80,    description: "TfL Contactless",   counterparty: "Transport for London",     reference: "TFL CONTACTLESS",   createdAt: d("2026-04-07") },
      { userId: evan.id, type: "DEBIT",  category: "GROCERIES",        amount: 62.40,   description: "Asda",              counterparty: "ASDA Stores Ltd",          reference: "ASDA STORES",       createdAt: d("2026-04-09") },
      { userId: evan.id, type: "DEBIT",  category: "EATING_OUT",       amount: 11.99,   description: "KFC",               counterparty: "KFC UK",                   reference: "KFC",               createdAt: d("2026-04-11") },
      { userId: evan.id, type: "DEBIT",  category: "BILLS",            amount: 2.99,    description: "Apple iCloud",      counterparty: "Apple Inc",                reference: "APPLE.COM/BILL",    createdAt: d("2026-04-12") },
      { userId: evan.id, type: "DEBIT",  category: "SHOPPING",         amount: 28.49,   description: "Amazon",            counterparty: "Amazon UK",                reference: "AMZ*ORDER",         createdAt: d("2026-04-14") },
      { userId: evan.id, type: "DEBIT",  category: "TRANSPORT",        amount: 9.80,    description: "Uber",              counterparty: "Uber BV",                  reference: "UBER* TRIP",        createdAt: d("2026-04-16") },
      { userId: evan.id, type: "DEBIT",  category: "BILLS",            amount: 25.00,   description: "PureGym",           counterparty: "PureGym Ltd",              reference: "GYM MONTHLY",       createdAt: d("2026-04-18") },
      { userId: evan.id, type: "DEBIT",  category: "EATING_OUT",       amount: 15.50,   description: "Nando's",           counterparty: "Nando's Chickenland Ltd",  reference: "NANDOS",            createdAt: d("2026-04-20") },
      { userId: evan.id, type: "DEBIT",  category: "ENTERTAINMENT",    amount: 5.99,    description: "Spotify",           counterparty: "Spotify Ltd",              reference: "SPOTIFY",           createdAt: d("2026-04-22") },
      { userId: evan.id, type: "DEBIT",  category: "SHOPPING",         amount: 52.00,   description: "Primark",           counterparty: "Primark Stores Ltd",       reference: "PRIMARK",           createdAt: d("2026-04-24") },
    ],
  });

  return NextResponse.json({
    message: "Demo data seeded successfully.",
    accounts: [
      { name: "Alice Johnson",  email: "alice@onepot.com",   password: "OnePot2026" },
      { name: "Bob Smith",      email: "bob@onepot.com",     password: "OnePot2026" },
      { name: "Charlie Brown",  email: "charlie@onepot.com", password: "OnePot2026" },
      { name: "Diana Prince",   email: "diana@onepot.com",   password: "OnePot2026" },
      { name: "Evan Williams",  email: "evan@onepot.com",    password: "OnePot2026" },
    ],
  });
}
