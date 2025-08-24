"use client";
import React from "react";
import { LoginHeader, LoginForm } from "./ui";

export const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-lg">
        <LoginHeader />
        <LoginForm />
      </div>
    </div>
  );
};
