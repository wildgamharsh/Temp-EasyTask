'use server';

import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

interface GenerateAdminState {
    success: boolean;
    message: string;
    filePath?: string;
}

export async function generateAdminSql(prevState: GenerateAdminState, formData: FormData): Promise<GenerateAdminState> {
    const email = formData.get('email') as string;
    const username = formData.get('username') as string;
    const fullName = formData.get('fullName') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as string || 'super_admin';

    if (!email || !username || !password || !fullName) {
        return { success: false, message: 'All fields are required' };
    }

    try {
        // 1. Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const userId = randomUUID();

        // 2. Prepare SQL
        const authSql = `
-- 1. Insert into auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '${userId}',
  'authenticated',
  'authenticated',
  '${email}',
  '${hashedPassword}',
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "${fullName}"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);
`;

        const publicSql = `
-- 2. Insert into public.admins
INSERT INTO public.admins (
  id,
  email,
  username,
  full_name,
  role
) VALUES (
  '${userId}',
  '${email}',
  '${username}',
  '${fullName}',
  '${role}'
);
`;

        const fullSql = `${authSql}\n${publicSql}`;

        // 3. Ensure tools directory exists
        const toolsDir = path.join(process.cwd(), 'tools');
        try {
            await fs.access(toolsDir);
        } catch {
            await fs.mkdir(toolsDir, { recursive: true });
        }

        // 4. Write to file
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `create_admin_${timestamp}.sql`;
        const filePath = path.join(toolsDir, fileName);

        await fs.writeFile(filePath, fullSql, 'utf8');

        return {
            success: true,
            message: `SQL file generated successfully!`,
            filePath: filePath
        };

    } catch (error) {
        console.error('Error generating admin SQL:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to generate SQL'
        };
    }
}
