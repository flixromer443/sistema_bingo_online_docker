using Microsoft.EntityFrameworkCore;
using Models;
using Slamdunk.WebApi.Models;
using System.Reflection.Emit;

namespace Data
{
    public class BingoDbContext : DbContext
    {
        public BingoDbContext(DbContextOptions<BingoDbContext> options) : base(options)
        {

        }

        public DbSet<Carton> Cartones { get; set; }

        public DbSet<Ganador> Ganadores { get; set; }
        public DbSet<Jugada> Jugadas { get; set; }
        public DbSet<Jugador> Jugadores { get; set; }
        public DbSet<Premio> Premios { get; set; }
        public DbSet<NumeroCarton> NumerosCarton { get; set; }
        public DbSet<Token> Tokens { get; set; }
        public DbSet<Tbl1DtsVariables> Tbl1DtsVariables { get; set; }
        public DbSet<NumeroSorteado> NumerosSorteados { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Token>()
                .HasOne(t => t.Jugador)
                .WithMany(j => j.Tokens)
                .HasForeignKey(t => t.JugadorId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}