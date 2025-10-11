using Microsoft.EntityFrameworkCore;
using SprintEvaluationProjectCropDeal.Models;

namespace SprintEvaluationProjectCropDeal.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    // Defining the table names
    public DbSet<Farmer> FarmersDetails { get; set; }
    public DbSet<Dealer> DealersDetails { get; set; }
    public DbSet<Crops> CropsDetails { get; set; }
    public DbSet<Payment> PaymentsDetails { get; set; }
    public DbSet<Admin> AdminDetails { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<CropPurchase> CropPurchases { get; set; }
    public DbSet<FarmerSubscription> FarmerSubscriptions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Cascade delete for Crops when Farmer is deleted
        modelBuilder.Entity<FarmerSubscription>()
            .HasKey(fs => new { fs.DealerId, fs.FarmerId });
            
        modelBuilder.Entity<FarmerSubscription>()
            .HasOne(fs => fs.Dealer)
            .WithMany(d => d.SubscribedFarmers)
            .HasForeignKey(fs => fs.DealerId);
            
        modelBuilder.Entity<FarmerSubscription>()
            .HasOne(fs => fs.Farmer)
            .WithMany(f => f.Subscribers)
            .HasForeignKey(fs => fs.FarmerId);
    }
}