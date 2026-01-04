import React from "react";

interface ErrorStateProps {
  error: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error }) => {
  return (
    <section className="py-12 md:py-20">
      <div className="max-w-4xl mx-auto text-center">
        <div className="text-xl text-red-600 font-light">{error}</div>
      </div>
    </section>
  );
};