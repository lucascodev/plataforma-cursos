export const PRIVACY_COOKIES = [
  { name: '__Host-ca-access', purpose: 'Mantém você conectado enquanto usa o site.', duration: 'Cerca de 1 hora' },
  { name: '__Host-ca-refresh', purpose: 'Renova a sessão sem pedir login de novo.', duration: '30 dias' },
  { name: '__Host-ca-verifier', purpose: 'Protege a volta do GitHub durante o login.', duration: '10 minutos' },
  { name: '__Host-ca-return', purpose: 'Lembra a página para onde voltar depois do login.', duration: '10 minutos' },
] as const;
