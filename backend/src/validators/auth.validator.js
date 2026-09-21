const { z } = require('zod');

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address format').toLowerCase().trim(),
    password: z.string().min(1, 'Password is required')
  })
});

const registerUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address format').toLowerCase().trim(),
    password: z.string().min(10, 'Password must be at least 10 characters long as per security policy'),
    name: z.string().min(2, 'Name must be at least 2 characters long').trim(),
    phone: z.string().optional(),
    roleId: z.string().min(1, 'Valid roleId is required'),
    businessDivision: z.enum(['construction', 'solar', 'suppliers']).nullable().optional(),
    isDemo: z.boolean().optional().default(false)
  })
});

module.exports = {
  loginSchema,
  registerUserSchema
};
