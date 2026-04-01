"use client";

import RegisterStepper from "../../../components/site/register/RegisterStepper";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-2xl mx-auto px-4">
        <RegisterStepper />
      </div>
    </div>
  );
}
