using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace sistema_bingo_online.Migrations
{
    /// <inheritdoc />
    public partial class migracion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Jugadas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    NumeroJugada = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Jugadas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Jugadores",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    Apellido = table.Column<string>(type: "text", nullable: false),
                    Dni = table.Column<string>(type: "text", nullable: false),
                    Telefono = table.Column<string>(type: "text", nullable: true),
                    CorreoElectronico = table.Column<string>(type: "text", nullable: true),
                    Alias = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Jugadores", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Tbl1DtsVariables",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Variable = table.Column<string>(type: "text", nullable: false),
                    Valor = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tbl1DtsVariables", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "NumerosSorteados",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Numero = table.Column<int>(type: "integer", nullable: false),
                    JugadaId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NumerosSorteados", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NumerosSorteados_Jugadas_JugadaId",
                        column: x => x.JugadaId,
                        principalTable: "Jugadas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Premios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    JugadaId = table.Column<int>(type: "integer", nullable: false),
                    Valor = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Premios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Premios_Jugadas_JugadaId",
                        column: x => x.JugadaId,
                        principalTable: "Jugadas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tokens",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Codigo = table.Column<string>(type: "text", nullable: false),
                    JugadorId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tokens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tokens_Jugadores_JugadorId",
                        column: x => x.JugadorId,
                        principalTable: "Jugadores",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Cartones",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    JugadaId = table.Column<int>(type: "integer", nullable: true),
                    TokenId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cartones", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Cartones_Jugadas_JugadaId",
                        column: x => x.JugadaId,
                        principalTable: "Jugadas",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Cartones_Tokens_TokenId",
                        column: x => x.TokenId,
                        principalTable: "Tokens",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Ganadores",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    JugadaId = table.Column<int>(type: "integer", nullable: false),
                    CartonId = table.Column<int>(type: "integer", nullable: false),
                    PremioId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ganadores", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Ganadores_Cartones_CartonId",
                        column: x => x.CartonId,
                        principalTable: "Cartones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Ganadores_Jugadas_JugadaId",
                        column: x => x.JugadaId,
                        principalTable: "Jugadas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Ganadores_Premios_PremioId",
                        column: x => x.PremioId,
                        principalTable: "Premios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "NumerosCarton",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Numero = table.Column<int>(type: "integer", nullable: false),
                    Marcado = table.Column<bool>(type: "boolean", nullable: false),
                    NLinea = table.Column<int>(type: "integer", nullable: false),
                    CartonId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NumerosCarton", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NumerosCarton_Cartones_CartonId",
                        column: x => x.CartonId,
                        principalTable: "Cartones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Cartones_JugadaId",
                table: "Cartones",
                column: "JugadaId");

            migrationBuilder.CreateIndex(
                name: "IX_Cartones_TokenId",
                table: "Cartones",
                column: "TokenId");

            migrationBuilder.CreateIndex(
                name: "IX_Ganadores_CartonId",
                table: "Ganadores",
                column: "CartonId");

            migrationBuilder.CreateIndex(
                name: "IX_Ganadores_JugadaId",
                table: "Ganadores",
                column: "JugadaId");

            migrationBuilder.CreateIndex(
                name: "IX_Ganadores_PremioId",
                table: "Ganadores",
                column: "PremioId");

            migrationBuilder.CreateIndex(
                name: "IX_NumerosCarton_CartonId",
                table: "NumerosCarton",
                column: "CartonId");

            migrationBuilder.CreateIndex(
                name: "IX_NumerosSorteados_JugadaId",
                table: "NumerosSorteados",
                column: "JugadaId");

            migrationBuilder.CreateIndex(
                name: "IX_Premios_JugadaId",
                table: "Premios",
                column: "JugadaId");

            migrationBuilder.CreateIndex(
                name: "IX_Tokens_JugadorId",
                table: "Tokens",
                column: "JugadorId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Ganadores");

            migrationBuilder.DropTable(
                name: "NumerosCarton");

            migrationBuilder.DropTable(
                name: "NumerosSorteados");

            migrationBuilder.DropTable(
                name: "Tbl1DtsVariables");

            migrationBuilder.DropTable(
                name: "Premios");

            migrationBuilder.DropTable(
                name: "Cartones");

            migrationBuilder.DropTable(
                name: "Jugadas");

            migrationBuilder.DropTable(
                name: "Tokens");

            migrationBuilder.DropTable(
                name: "Jugadores");
        }
    }
}
