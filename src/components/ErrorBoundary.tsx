'use client'
import React from 'react'

export class ErrorBoundary extends React.Component<{children: React.ReactNode, fallback?: (error: Error) => React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback(this.state.error!)
      return (
        <div className="p-10 m-10 bg-red-100 text-red-900 border-2 border-red-500 font-mono text-sm overflow-auto">
          <h2 className="text-xl font-bold mb-4">React Render Crash:</h2>
          <p className="font-bold underline">{this.state.error?.message}</p>
          <pre className="mt-4 break-all whitespace-pre-wrap">{this.state.error?.stack}</pre>
        </div>
      )
    }
    return this.props.children
  }
}
