import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI.
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service here.
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-100 text-red-800 rounded">
          Something went wrong with the Sentiment Geolocation Map.
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
