using SprintEvaluationProjectCropDeal.Models;
using SprintEvaluationProjectCropDeal.Repositories.Interfaces;
using SprintEvaluationProjectCropDeal.Services.Interfaces;

namespace SprintEvaluationProjectCropDeal.Services.Implementations;

public class PaymentService : IPaymentService
{
    private readonly IPaymentRepository _paymentRepository;

    public PaymentService(IPaymentRepository paymentRepository)
    {
        _paymentRepository = paymentRepository;
    }

    public async Task<IEnumerable<Payment>> GetAllAsync()
    {
        return await _paymentRepository.GetAllAsync();
    }

    public async Task<Payment?> GetByIdAsync(int id)
    {
        return await _paymentRepository.GetByIdAsync(id);
    }

    public async Task AddAsync(Payment payment)
    {
        await _paymentRepository.AddAsync(payment);
    }

    public async Task UpdateAsync(Payment payment)
    {
        await _paymentRepository.UpdateAsync(payment);
    }

    public async Task DeleteAsync(int id)
    {
        await _paymentRepository.DeleteAsync(id);
    }
}