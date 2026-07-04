function getPasswordStrength(password: string) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];

  const passed = checks.filter(Boolean).length;

  if (passed <= 1) return { score: 0, label: "Weak" };
  if (passed === 2) return { score: 1, label: "Fair" };
  if (passed === 3) return { score: 2, label: "Good" };
  return { score: 3, label: "Strong" };
}
