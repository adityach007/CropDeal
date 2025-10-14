using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace _.Migrations
{
    /// <inheritdoc />
    public partial class MigrationsStarted : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AdminDetails",
                columns: table => new
                {
                    AdminId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AdminName = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    Password = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AdminPhoneNumber = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    AdminEmailAddress = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AdminAadharNumber = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    AdminIFSCCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AdminBankAccount = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsAdminIdActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AdminDetails", x => x.AdminId);
                });

            migrationBuilder.CreateTable(
                name: "DealersDetails",
                columns: table => new
                {
                    DealerId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DealerName = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    Password = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DealerPhoneNumber = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    DealerEmailAddress = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DealerAadharNumber = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    DealerBankAccount = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DealerIFSCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DealerLocation = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsDealerIdActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DealersDetails", x => x.DealerId);
                });

            migrationBuilder.CreateTable(
                name: "FarmersDetails",
                columns: table => new
                {
                    FarmerId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Password = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FarmerName = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    EmailAddressFarmer = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FarmerPhoneNumber = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    FarmerAadharNumber = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false),
                    FarmerBankAccount = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    FarmerIFSCCode = table.Column<string>(type: "nvarchar(11)", maxLength: 11, nullable: false),
                    FarmerLocation = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsFarmerIdActive = table.Column<bool>(type: "bit", nullable: false),
                    SubscriberCount = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FarmersDetails", x => x.FarmerId);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Password = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PhoneNumber = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    AadharNumber = table.Column<string>(type: "nvarchar(12)", maxLength: 12, nullable: false),
                    Role = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.UserId);
                });

            migrationBuilder.CreateTable(
                name: "CropsDetails",
                columns: table => new
                {
                    CropId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CropType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CropName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    QuantityInKg = table.Column<int>(type: "int", nullable: false),
                    Location = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FarmerId = table.Column<int>(type: "int", nullable: false),
                    PricePerUnit = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CropsDetails", x => x.CropId);
                    table.ForeignKey(
                        name: "FK_CropsDetails_FarmersDetails_FarmerId",
                        column: x => x.FarmerId,
                        principalTable: "FarmersDetails",
                        principalColumn: "FarmerId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FarmerSubscriptions",
                columns: table => new
                {
                    DealerId = table.Column<int>(type: "int", nullable: false),
                    FarmerId = table.Column<int>(type: "int", nullable: false),
                    SubscribedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FarmerSubscriptions", x => new { x.DealerId, x.FarmerId });
                    table.ForeignKey(
                        name: "FK_FarmerSubscriptions_DealersDetails_DealerId",
                        column: x => x.DealerId,
                        principalTable: "DealersDetails",
                        principalColumn: "DealerId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FarmerSubscriptions_FarmersDetails_FarmerId",
                        column: x => x.FarmerId,
                        principalTable: "FarmersDetails",
                        principalColumn: "FarmerId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PaymentsDetails",
                columns: table => new
                {
                    PaymentId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FarmerId = table.Column<int>(type: "int", nullable: false),
                    DealerId = table.Column<int>(type: "int", nullable: false),
                    CropId = table.Column<int>(type: "int", nullable: false),
                    PurchaseId = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<double>(type: "float", nullable: false),
                    TransactionDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TransactionStatus = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CanBeReviewed = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PaymentsDetails", x => x.PaymentId);
                    table.ForeignKey(
                        name: "FK_PaymentsDetails_FarmersDetails_FarmerId",
                        column: x => x.FarmerId,
                        principalTable: "FarmersDetails",
                        principalColumn: "FarmerId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CropPurchases",
                columns: table => new
                {
                    PurchaseId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DealerId = table.Column<int>(type: "int", nullable: false),
                    CropId = table.Column<int>(type: "int", nullable: false),
                    QuantityRequested = table.Column<int>(type: "int", nullable: false),
                    RequestedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    Rating = table.Column<int>(type: "int", nullable: true),
                    ReviewText = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ReviewDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    HasBeenReviewed = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CropPurchases", x => x.PurchaseId);
                    table.ForeignKey(
                        name: "FK_CropPurchases_CropsDetails_CropId",
                        column: x => x.CropId,
                        principalTable: "CropsDetails",
                        principalColumn: "CropId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CropPurchases_DealersDetails_DealerId",
                        column: x => x.DealerId,
                        principalTable: "DealersDetails",
                        principalColumn: "DealerId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CropPurchases_CropId",
                table: "CropPurchases",
                column: "CropId");

            migrationBuilder.CreateIndex(
                name: "IX_CropPurchases_DealerId",
                table: "CropPurchases",
                column: "DealerId");

            migrationBuilder.CreateIndex(
                name: "IX_CropsDetails_FarmerId",
                table: "CropsDetails",
                column: "FarmerId");

            migrationBuilder.CreateIndex(
                name: "IX_FarmerSubscriptions_FarmerId",
                table: "FarmerSubscriptions",
                column: "FarmerId");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentsDetails_FarmerId",
                table: "PaymentsDetails",
                column: "FarmerId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AdminDetails");

            migrationBuilder.DropTable(
                name: "CropPurchases");

            migrationBuilder.DropTable(
                name: "FarmerSubscriptions");

            migrationBuilder.DropTable(
                name: "PaymentsDetails");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "CropsDetails");

            migrationBuilder.DropTable(
                name: "DealersDetails");

            migrationBuilder.DropTable(
                name: "FarmersDetails");
        }
    }
}
