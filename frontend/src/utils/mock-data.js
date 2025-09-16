export const mockMenuItems = [
    {
      id: 1,
      name: "Chicken Rice",
      price: 8.5,
      waitTime: "15-20 mins",
      image: "/placeholder.svg?height=200&width=300",
      description: "Tender chicken with fragrant rice",
      vendor: "Uncle Wong Kitchen",
    },
    {
      id: 2,
      name: "Beef Noodles",
      price: 12.0,
      waitTime: "20-25 mins",
      image: "/placeholder.svg?height=200&width=300",
      description: "Rich beef broth with fresh noodles",
      vendor: "Noodle Master",
    },
    {
      id: 3,
      name: "Vegetarian Curry",
      price: 9.0,
      waitTime: "10-15 mins",
      image: "/placeholder.svg?height=200&width=300",
      description: "Spicy vegetarian curry with rice",
      vendor: "Green Garden",
    },
    {
      id: 4,
      name: "Fish & Chips",
      price: 15.0,
      waitTime: "25-30 mins",
      image: "/placeholder.svg?height=200&width=300",
      description: "Crispy fish with golden fries",
      vendor: "Ocean Bites",
    },
  ]
  
  export const mockOrders = [
    {
      id: 1,
      ticketNumber: 1001,
      customerName: "John Doe",
      customerPhone: "+1234567890",
      items: [{ name: "Chicken Rice", quantity: 2, price: 8.5 }],
      total: 17.0,
      status: "pending",
      orderTime: "2:30 PM",
    },
    {
      id: 2,
      ticketNumber: 1002,
      customerName: "Jane Smith",
      customerPhone: "+1234567891",
      items: [{ name: "Beef Noodles", quantity: 1, price: 12.0 }],
      total: 12.0,
      status: "pending",
      orderTime: "2:45 PM",
    },
  ]
  