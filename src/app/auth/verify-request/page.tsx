"use client"

import { motion } from "framer-motion"
import { Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl p-8 text-center"
      >
        <div className="w-16 h-16 bg-gradient-to-r from-gray-900 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8 text-white" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Check your email</h1>
        
        <p className="text-gray-600 mb-8">
          A sign in link has been sent to your email address. Click the link in the email to sign in.
        </p>
        
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            Didn't receive the email? Check your spam folder or try signing in again.
          </p>
          
          <Link
            href="/auth/signin"
            className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Back to Sign In
          </Link>
          
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 py-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}