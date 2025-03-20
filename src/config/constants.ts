export const roleRights = new Map<string, string[]>();

roleRights.set('admin', [
  'getUsers', 
  
]);



export const JWT_SECRET = process.env.JWT_SECRET || 'your-default-jwt-secret';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export default {
  roleRights,
  JWT_SECRET,
  JWT_EXPIRES_IN
};