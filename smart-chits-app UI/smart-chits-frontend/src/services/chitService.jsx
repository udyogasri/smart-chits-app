// Mock chit service for frontend functionality
export const getAllChits = async () => {
  // Return mock data for now
  return [
    {
      id: 1,
      name: 'Monthly Chit Fund',
      description: 'A monthly savings and investment scheme',
      organizer: 'Admin',
      status: 'active',
      totalAmount: 10000,
      monthlyContribution: 1000,
      duration: 10,
      members: 10
    },
    {
      id: 2,
      name: 'Quarterly Investment Plan',
      description: 'A quarterly investment chit fund',
      organizer: 'Admin',
      status: 'active',
      totalAmount: 30000,
      monthlyContribution: 3000,
      duration: 12,
      members: 15
    },
    {
      id: 3,
      name: 'Special Purpose Fund',
      description: 'A specialized chit fund for specific goals',
      organizer: 'Admin',
      status: 'completed',
      totalAmount: 5000,
      monthlyContribution: 500,
      duration: 10,
      members: 8
    }
  ]
}

export const getChitById = async (id) => {
  const chits = await getAllChits()
  return chits.find(chit => chit.id === id)
}
