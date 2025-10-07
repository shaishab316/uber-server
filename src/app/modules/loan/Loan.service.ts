
export const LoanServices = {
  async create(loanData: TLoan) {
    return Loan.create(loanData);
  },
};
