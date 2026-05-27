using Microsoft.EntityFrameworkCore;
using OpsTrax.Api.Domain;

namespace OpsTrax.Api.Data;

public class OpsTraxDbContext(DbContextOptions<OpsTraxDbContext> options) : DbContext(options)
{
    public DbSet<DemoEntity> DemoEntities => Set<DemoEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<DemoEntity>().HasNoKey();
    }
}
