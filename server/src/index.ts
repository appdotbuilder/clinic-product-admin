import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import handlers
import { getProducts } from './handlers/get_products';
import { authenticateUser } from './handlers/authenticate_user';
import { checkAdminAccess, UnauthorizedError } from './handlers/check_admin_access';

// Import types
import { type AuthContext } from './schema';

const t = initTRPC.context<AuthContext>().create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

// Admin-only procedure that checks for admin role
const adminProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const hasAccess = await checkAdminAccess(ctx.user);
  if (!hasAccess) {
    throw new UnauthorizedError();
  }
  return next();
});

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Get products - admin only endpoint
  getProducts: adminProcedure
    .query(async () => {
      return await getProducts();
    }),

  // Authentication endpoint for testing
  authenticate: publicProcedure
    .input(z.object({ token: z.string().optional() }))
    .query(async ({ input }) => {
      const user = await authenticateUser(input.token);
      return { user };
    }),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext: async ({ req }) => {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith('Bearer ') 
        ? authHeader.slice(7) 
        : undefined;
      
      // Authenticate user
      const user = await authenticateUser(token);
      
      return { user };
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();