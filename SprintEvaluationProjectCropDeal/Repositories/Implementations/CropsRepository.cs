using Microsoft.EntityFrameworkCore;
using SprintEvaluationProjectCropDeal.Data;
using SprintEvaluationProjectCropDeal.Models;
using SprintEvaluationProjectCropDeal.Repositories.Interfaces;

namespace SprintEvaluationProjectCropDeal.Repositories.Implementations;

public class CropsRepository : ICropsRepository
{
    private readonly ApplicationDbContext _context;

    public CropsRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Crops>> GetAllAsync()
    {
        return await _context.CropsDetails.ToListAsync();
    }

    public async Task<Crops?> GetByIdAsync(int id)
    {
        return await _context.CropsDetails.FindAsync(id);
    }

    public async Task AddAsync(Crops crop)
    {
        await _context.CropsDetails.AddAsync(crop);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Crops crop)
    {
        _context.CropsDetails.Update(crop);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Crops crop)
    {
        var deletedCrop = _context.CropsDetails.FindAsync(crop.CropId);

        if (deletedCrop != null)
        {
            _context.CropsDetails.Remove(crop);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<Crops?> GetByIdAsNoTrackingAsync(int id)
    {
        return await _context.CropsDetails
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.CropId == id);
    }
}