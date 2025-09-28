export const SignJWT = jest.fn().mockImplementation((payload) => ({
  setProtectedHeader: jest.fn().mockReturnThis(),
  setIssuedAt: jest.fn().mockReturnThis(),
  setExpirationTime: jest.fn().mockReturnThis(),
  setIssuer: jest.fn().mockReturnThis(),
  setAudience: jest.fn().mockReturnThis(),
  setSubject: jest.fn().mockReturnThis(),
  sign: jest.fn().mockResolvedValue(`mock-header.${btoa(JSON.stringify(payload))}.mock-signature`),
}));

export const jwtVerify = jest.fn().mockImplementation((token, secret, options) => {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token format');
  }
  const payload = JSON.parse(atob(parts[1]));
  return Promise.resolve({
    payload: {
      ...payload,
      sub: payload.sub || 'mock-user-id',
      email: payload.email || 'mock@example.com',
      role: payload.role || 'user',
      permissions: payload.permissions || ['read', 'write'],
      tokenType: payload.tokenType || 'access',
      iat: payload.iat || Date.now() / 1000,
      exp: payload.exp || (Date.now() / 1000) + 3600,
      jti: payload.jti || 'mock-jti',
      documentId: payload.documentId || 'mock-document-id',
      signatureId: payload.signatureId || 'mock-signature-id',
      workflowId: payload.workflowId || 'mock-workflow-id',
    },
  });
});
