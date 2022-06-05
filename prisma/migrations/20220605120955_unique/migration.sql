/*
  Warnings:

  - A unique constraint covering the columns `[login,email,phone_number]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "users_login_email_phone_number_key" ON "users"("login", "email", "phone_number");
