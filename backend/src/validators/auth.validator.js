const { z } = require('zod');

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
    password: z.string().min(1, 'Password is required')
  })
});

const signupSchema = z.object({
  body: z.object({
    email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    name: z.string().min(2, 'Name must be at least 2 characters long').trim(),
    phone: z.string().optional(),
    role: z.string().optional().default('Owner'),
    businessDivision: z.enum(['construction', 'solar', 'suppliers']).nullable().optional()
  })
});

const registerUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address format').toLowerCase().trim(),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    name: z.string().min(2, 'Name must be at least 2 characters long').trim(),
    phone: z.string().optional(),
    roleId: z.string().optional(),
    role: z.string().optional(),
    businessDivision: z.enum(['construction', 'solar', 'suppliers']).nullable().optional(),
    isDemo: z.boolean().optional().default(false)
  })
});

module.exports = {
  loginSchema,
  signupSchema,
  registerUserSchema
};
