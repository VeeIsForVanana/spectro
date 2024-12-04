declare namespace App {
    interface Locals {
        ctx?: {
            db: import('$lib/server/database').Database;
            logger: import('pino').Logger;
            session?: {
                sid: import('$lib/server/database/models/oauth').Session['id'];
                user?: Omit<import('$lib/server/database/models/app').User, 'createdAt' | 'updatedAt'>;
            };
        };
    }
}
