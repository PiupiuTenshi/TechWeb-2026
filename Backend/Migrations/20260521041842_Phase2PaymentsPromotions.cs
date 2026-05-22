using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class Phase2PaymentsPromotions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InventoryLogs_Users_CreatedByUserUserId",
                table: "InventoryLogs");

            migrationBuilder.DropForeignKey(
                name: "FK_OrderStatusLogs_Users_ChangedByUserUserId",
                table: "OrderStatusLogs");

            migrationBuilder.DropIndex(
                name: "IX_OrderStatusLogs_ChangedByUserUserId",
                table: "OrderStatusLogs");

            migrationBuilder.DropIndex(
                name: "IX_InventoryLogs_CreatedByUserUserId",
                table: "InventoryLogs");

            migrationBuilder.DropColumn(
                name: "ChangedByUserUserId",
                table: "OrderStatusLogs");

            migrationBuilder.DropColumn(
                name: "CreatedByUserUserId",
                table: "InventoryLogs");

            migrationBuilder.AddColumn<string>(
                name: "RefundNote",
                table: "Payments",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "RefundedAt",
                table: "Payments",
                type: "datetime2",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrderStatusLogs_ChangedBy",
                table: "OrderStatusLogs",
                column: "ChangedBy");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryLogs_CreatedBy",
                table: "InventoryLogs",
                column: "CreatedBy");

            migrationBuilder.AddForeignKey(
                name: "FK_InventoryLogs_Users_CreatedBy",
                table: "InventoryLogs",
                column: "CreatedBy",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_OrderStatusLogs_Users_ChangedBy",
                table: "OrderStatusLogs",
                column: "ChangedBy",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InventoryLogs_Users_CreatedBy",
                table: "InventoryLogs");

            migrationBuilder.DropForeignKey(
                name: "FK_OrderStatusLogs_Users_ChangedBy",
                table: "OrderStatusLogs");

            migrationBuilder.DropIndex(
                name: "IX_OrderStatusLogs_ChangedBy",
                table: "OrderStatusLogs");

            migrationBuilder.DropIndex(
                name: "IX_InventoryLogs_CreatedBy",
                table: "InventoryLogs");

            migrationBuilder.DropColumn(
                name: "RefundNote",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "RefundedAt",
                table: "Payments");

            migrationBuilder.AddColumn<Guid>(
                name: "ChangedByUserUserId",
                table: "OrderStatusLogs",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserUserId",
                table: "InventoryLogs",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrderStatusLogs_ChangedByUserUserId",
                table: "OrderStatusLogs",
                column: "ChangedByUserUserId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryLogs_CreatedByUserUserId",
                table: "InventoryLogs",
                column: "CreatedByUserUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_InventoryLogs_Users_CreatedByUserUserId",
                table: "InventoryLogs",
                column: "CreatedByUserUserId",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_OrderStatusLogs_Users_ChangedByUserUserId",
                table: "OrderStatusLogs",
                column: "ChangedByUserUserId",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
