using Microsoft.EntityFrameworkCore;
using SprintEvaluationProjectCropDeal.Data;
using SprintEvaluationProjectCropDeal.Models;
using SprintEvaluationProjectCropDeal.Repositories.Interfaces;

namespace SprintEvaluationProjectCropDeal.Repositories.Implementations;

public class PaymentRepository : IPaymentRepository
{
    private readonly ApplicationDbContext _context;

    public PaymentRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Payment>> GetAllAsync()
    {
        return await _context.PaymentsDetails.ToListAsync();
    }

    public async Task<Payment?> GetByIdAsync(int id)
    {
        return await _context.PaymentsDetails.FindAsync(id);
    }

    public async Task AddAsync(Payment payment)
    {
        await _context.PaymentsDetails.AddAsync(payment);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Payment payment)
    {
        _context.PaymentsDetails.Update(payment);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Payment payment)
    {
        var paymentDeleted = _context.PaymentsDetails.FindAsync(payment.PaymentId);

        if (paymentDeleted != null)
        {
            _context.PaymentsDetails.Remove(payment);
            await _context.SaveChangesAsync();
        }
    }

    public Task DeleteAsync(int id)
    {
        throw new NotImplementedException();
    }
}