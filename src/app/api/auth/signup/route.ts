import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getUsersCollection } from "@/lib/database"
import type { CreateUserInput, User } from "@/server/models"

export async function POST(request: NextRequest) {
  try {
    const body: CreateUserInput = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    const users = await getUsersCollection()
    
    const existingUser = await users.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const newUser: User = {
      email,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await users.insertOne(newUser)

    return NextResponse.json(
      { 
        message: "User created successfully",
        userId: result.insertedId 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
