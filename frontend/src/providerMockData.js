// providerMockData.js
const providerMockData = {
    captureSection: {
      instructions: "Please scan or upload the guest's ID document.",
      progress: 45, // e.g., 45% progress for demonstration
    },
    statusMessages: [
      "Waiting for scan...",
      "File uploaded. Processing OCR...",
      "Verification successful: No security flags detected."
    ],
    checkInHistory: [
      {
        dateTime: "2025-02-12 09:15",
        guestName: "John Doe",
        status: "Verified",
        riskScore: 25
      },
      {
        dateTime: "2025-02-12 10:45",
        guestName: "Jane Smith",
        status: "Flagged",
        riskScore: 85
      },
      {
        dateTime: "2025-02-12 11:30",
        guestName: "Alice Johnson",
        status: "Verified",
        riskScore: 30
      }
    ]
  };
  
  export default providerMockData;
  