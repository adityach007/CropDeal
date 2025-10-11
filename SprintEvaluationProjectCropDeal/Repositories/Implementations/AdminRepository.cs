using Microsoft.EntityFrameworkCore;
using SprintEvaluationProjectCropDeal.Data;
using SprintEvaluationProjectCropDeal.Models;
using SprintEvaluationProjectCropDeal.Repositories.Interfaces;

namespace SprintEvaluationProjectCropDeal.Repositories.Implementations
{
    public class AdminRepository : IAdminRepository
    {
        private readonly ApplicationDbContext _context;

        public AdminRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Admin admin)
        {
            await _context.AdminDetails.AddAsync(admin);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Admin admin)
        {
            _context.AdminDetails.Remove(admin);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var admin = await GetByIdAsync(id);
            if (admin != null)
            {
                _context.AdminDetails.Remove(admin);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<Admin>> GetAllAsync()
        {
            return await _context.AdminDetails.ToListAsync();
        }

        public async Task<Admin?> GetByEmailAsync(string email)
        {
            return await _context.AdminDetails
                .FirstOrDefaultAsync(a => a.AdminEmailAddress == email);
        }

        public async Task<Admin?> GetByEmailIdAsync(Admin admin)
        {
            return await _context.AdminDetails
                .FirstOrDefaultAsync(a => a.AdminEmailAddress == admin.AdminEmailAddress);
        }

        public async Task<Admin?> GetByIdAsync(int id)
        {
            return await _context.AdminDetails
                .FirstOrDefaultAsync(a => a.AdminId == id);
        }

        public async Task UpdateAsync(Admin admin)
        {
            _context.AdminDetails.Update(admin);
            await _context.SaveChangesAsync();
        }
    }
}