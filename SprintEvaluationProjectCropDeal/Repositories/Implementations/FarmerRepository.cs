using Microsoft.EntityFrameworkCore;
using SprintEvaluationProjectCropDeal.Data;
using SprintEvaluationProjectCropDeal.Models;
using SprintEvaluationProjectCropDeal.Repositories.Interfaces;

namespace SprintEvaluationProjectCropDeal.Repositories.Implementations;

public class FarmerRepository : IFarmerRepository
{
    private readonly ApplicationDbContext _context;

    public FarmerRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Farmer>> GetAllAsync()
    {
        return await _context.FarmersDetails.ToListAsync();
    }

    public async Task<Farmer?> GetByIdAsync(int id)
    {
        return await _context.FarmersDetails.FindAsync(id);
    }

    public async Task<Farmer?> GetByEmailAsync(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return null;

        return await _context.FarmersDetails
            .FirstOrDefaultAsync(f => f.EmailAddressFarmer == email);
    }

    public async Task<Farmer?> GetByAadharAsync(string aadharNumber)
    {
        if (string.IsNullOrWhiteSpace(aadharNumber))
            return null;

        return await _context.FarmersDetails
            .FirstOrDefaultAsync(f => f.FarmerAadharNumber == aadharNumber);
    }

    public async Task<Farmer?> GetByPhoneAsync(string phoneNumber)
    {
        if (string.IsNullOrWhiteSpace(phoneNumber))
            return null;

        return await _context.FarmersDetails
            .FirstOrDefaultAsync(f => f.FarmerPhoneNumber == phoneNumber);
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _context.FarmersDetails
            .AnyAsync(f => f.FarmerId == id);
    }

    public async Task AddAsync(Farmer farmer)
    {
        if (farmer == null)
            throw new ArgumentNullException(nameof(farmer));

        await _context.FarmersDetails.AddAsync(farmer);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Farmer farmer)
    {
        if (farmer == null)
            throw new ArgumentNullException(nameof(farmer));

        _context.FarmersDetails.Update(farmer);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var farmer = await _context.FarmersDetails.FindAsync(id);
        if (farmer != null)
        {
            _context.FarmersDetails.Remove(farmer);
            await _context.SaveChangesAsync();
        }
    }
}