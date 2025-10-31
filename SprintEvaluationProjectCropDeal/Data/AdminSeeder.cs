using SprintEvaluationProjectCropDeal.Models;
using System.Security.Cryptography;
using System.Text;

namespace SprintEvaluationProjectCropDeal.Data;

public static class AdminSeeder
{
    public static async Task SeedAdminAsync(ApplicationDbContext context)
    {
        // Check if admin already exists
        var existingAdmin = context.AdminDetails.FirstOrDefault(a => a.AdminEmailAddress == "aditya@example.com");
        
        if (existingAdmin == null)
        {
            var admin = new Admin
            {
                AdminName = "Aditya Admin",
                AdminEmailAddress = "aditya@example.com",
                AdminPhoneNumber = "9999999999",
                AdminAadharNumber = "9999999999",
                AdminBankAccount = "9999999999",
                AdminIFSCCode = "ADMIN0001",
                IsAdminIdActive = true,
                Password = HashPassword("aditya1234")
            };

            context.AdminDetails.Add(admin);
            await context.SaveChangesAsync();
        }
    }

    private static string HashPassword(string password)
    {
        using var rng = RandomNumberGenerator.Create();
        byte[] saltBytes = new byte[16];
        rng.GetBytes(saltBytes);
        
        var pbkdf2 = new Rfc2898DeriveBytes(password, saltBytes, 10000, HashAlgorithmName.SHA256);
        byte[] hashBytes = pbkdf2.GetBytes(32);
        
        byte[] hashWithSaltBytes = new byte[48];
        Array.Copy(saltBytes, 0, hashWithSaltBytes, 0, 16);
        Array.Copy(hashBytes, 0, hashWithSaltBytes, 16, 32);
        
        return Convert.ToBase64String(hashWithSaltBytes);
    }
}
