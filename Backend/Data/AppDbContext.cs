using Microsoft.EntityFrameworkCore;
using TechShop.Backend.Models;

namespace TechShop.Backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    public DbSet<User> Users { get; set; }
}
