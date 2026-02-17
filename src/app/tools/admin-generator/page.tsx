'use client';

import { useActionState } from 'react';
import { generateAdminSql } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const initialState = {
    success: false,
    message: '',
    filePath: '',
};

export default function AdminGeneratorPage() {
    const [state, formAction, isPending] = useActionState(generateAdminSql, initialState);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center text-indigo-700">Admin SQL Generator</CardTitle>
                    <CardDescription className="text-center">
                        Generate secure SQL to add a new admin user.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={formAction} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="admin@example.com"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                name="username"
                                type="text"
                                placeholder="admin_username"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                                id="fullName"
                                name="fullName"
                                type="text"
                                placeholder="Admin Name"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select name="role" defaultValue="super_admin">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="super_admin">Super Admin</SelectItem>
                                    <SelectItem value="support">Support</SelectItem>
                                    <SelectItem value="moderator">Moderator</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Strong password..."
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-700"
                            disabled={isPending}
                        >
                            {isPending ? 'Generating...' : 'Generate SQL File'}
                        </Button>

                        {state.message && (
                            <div className={`p-3 rounded-md text-sm ${state.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                <p className="font-medium">{state.success ? 'Success!' : 'Error'}</p>
                                <p>{state.message}</p>
                                {state.success && state.filePath && (
                                    <p className="mt-2 text-xs break-all font-mono bg-white p-1 rounded border">
                                        File created at: <br />
                                        {state.filePath}
                                    </p>
                                )}
                            </div>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
