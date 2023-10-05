// Example 1: User Authentication System

// class User {
//   constructor(username, email) {
//     this.username = username;
//     this.email = email;
//     this.loggedIn = false;
//   }

//   login() {
//     this.loggedIn = true;
//     console.log(`${this.username} is now logged in.`);
//   }

//   logout() {
//     this.loggedIn = false;
//     console.log(`${this.username} is now logged out.`);
//   }
// }

// class AdminUser extends User {
//   constructor(username, email) {
//     super(username, email);
//     this.adminRights = true;
//   }

//   deleteAccount(user) {
//     console.log(
//       `Admin ${this.username} has deleted the account of ${user.username}.`
//     );
//   }
// }

// class RegularUser extends User {
//   constructor(username, email) {
//     super(username, email);
//   }

//   postComment(text) {
//     console.log(`${this.username} posted a comment: "${text}"`);
//   }
// }

// const user = new RegularUser("Rashed", "admin@example.com");
// user.login();
// user.postComment("Beautiful Website!");
// user.logout();
// const admin = new AdminUser("Menon", "menon@admin.com");
// admin.login();
// admin.deleteAccount({ username: "Rashed" });
// admin.logout();

// Example 2: Banking System

// class Account {
//   constructor(accountNumber, balance) {
//     this.accountNumber = accountNumber;
//     this.balance = balance;
//   }

//   deposit(amount) {
//     this.balance += amount;
//     console.log(`Deposited $${amount}. New balance: $${this.balance}`);
//   }

//   withdraw(amount) {
//     if (this.balance >= amount) {
//       this.balance -= amount;
//       console.log(`Withdrawn $${amount}. Current balance: $${this.balance}`);
//     }
//   }
// }

// class SavingAccount extends Account {
//   constructor(accountNumber, balance, interestRate) {
//     super(accountNumber, balance);
//     this.interestRate = interestRate;
//   }
//   calculateInterest() {
//     const interest = (this.balance * this.interestRate) / 100;
//     console.log(`Interest Earned: $${interest}`);
//   }
// }

// class CheckingAccount extends Account {
//   constructor(accountNumber, balance, overDraftLimit) {
//     super(accountNumber, balance);
//     this.overDraftLimit = overDraftLimit;
//   }

//   withdraw(amount) {
//     if (this.balance + this.overDraftLimit >= amount) {
//       this.balance -= amount;
//       console.log(`Withdrawn $${amount}. New balance: ${this.balance}`);
//     } else {
//       console.log(`Exceeded overdraft limit. Current balance: ${this.balance}`);
//     }
//   }
// }

// const account1 = new Account("334BTC", 5000);
// console.log(account1);
// account1.deposit(500);
// account1.withdraw(100);

// const sa1 = new SavingAccount("35BRT", 1000, 5);
// sa1.deposit(2000);
// console.log(sa1.balance);
// sa1.calculateInterest();

// const ca1 = new CheckingAccount("4487fsd", 1500, 500);
// ca1.withdraw(7100);

// const text = "bangladesh a";
// const lines = text.split("", 3);
// console.log(lines);

// const colors = ["red", "yellow", "green", "black"];

// for (color of colors) {
//   console.log(color);
// }

// const text = "Hello, wolrd!";
// const regex = /Hello/;

// const isMatch = regex.test(text);
// console.log(isMatch);

// function searchAndDisplayMatchingLines(text, pattern) {
//   const regex = new RegExp(pattern, "g");
//   const lines = text.split("\n");
//   const matchingLines = [];

//   for (const line of lines) {
//     if (regex.test(line)) {
//       matchingLines.push(line);
//     }
//   }
//   return matchingLines;
// }
// const text = `
// Line 1: This is a sample line.
// Line 2: Another line with some text.
// Line 3: Yet another line.
// Line 4: Last line of the text block.
// `;
// const pattern = /Another/;
// const result = searchAndDisplayMatchingLines(text, pattern);
// console.log(result);
// try {
//   eval("Hello world"); // This will throw a SyntaxError
// } catch (error) {
//   console.error("========>", error);
//   console.error("========>", error.name);
//   console.error("========>", error.message);
//   const newerror = throw new Error("");
//   console.error("========>", newerror.name);
// }

const person = {
  firstName: "John",
  lastName: "Doe",
  age: 30,
};

for (const key in person) {
  console.log(`${key}: ${person.key}`);
}
