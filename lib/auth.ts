import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

export interface JWTPayload { id:number; username:string; email:string; role:string }
const SECRET = process.env.JWT_SECRET || 'fxcomunity-dev-secret'
export const signToken = (p:JWTPayload) => jwt.sign(p, SECRET, { expiresIn:'7d' })
export function verifyToken(t:string):JWTPayload|null { try { return jwt.verify(t,SECRET) as JWTPayload } catch { return null } }
export function getToken(req:NextRequest) { return req.cookies.get('token')?.value || req.headers.get('authorization')?.replace('Bearer ','') || null }
export async function getCurrentUser():Promise<JWTPayload|null> { const t=cookies().get('token')?.value; return t?verifyToken(t):null }
