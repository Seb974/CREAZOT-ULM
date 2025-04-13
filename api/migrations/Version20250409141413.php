<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250409141413 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE reservation_contact (reservation_id INT NOT NULL, contact_id INT NOT NULL, PRIMARY KEY(reservation_id, contact_id))');
        $this->addSql('CREATE INDEX IDX_2BF75DBDB83297E7 ON reservation_contact (reservation_id)');
        $this->addSql('CREATE INDEX IDX_2BF75DBDE7A1254A ON reservation_contact (contact_id)');
        $this->addSql('CREATE TABLE reservation_origine (reservation_id INT NOT NULL, origine_id INT NOT NULL, PRIMARY KEY(reservation_id, origine_id))');
        $this->addSql('CREATE INDEX IDX_729E0DEAB83297E7 ON reservation_origine (reservation_id)');
        $this->addSql('CREATE INDEX IDX_729E0DEA87998E ON reservation_origine (origine_id)');
        $this->addSql('ALTER TABLE reservation_contact ADD CONSTRAINT FK_2BF75DBDB83297E7 FOREIGN KEY (reservation_id) REFERENCES reservation (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE reservation_contact ADD CONSTRAINT FK_2BF75DBDE7A1254A FOREIGN KEY (contact_id) REFERENCES contact (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE reservation_origine ADD CONSTRAINT FK_729E0DEAB83297E7 FOREIGN KEY (reservation_id) REFERENCES reservation (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE reservation_origine ADD CONSTRAINT FK_729E0DEA87998E FOREIGN KEY (origine_id) REFERENCES origine (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE reservation ADD position VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE reservation ADD paid BOOLEAN DEFAULT NULL');
        $this->addSql('ALTER TABLE reservation ADD upsell BOOLEAN DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE reservation_contact DROP CONSTRAINT FK_2BF75DBDB83297E7');
        $this->addSql('ALTER TABLE reservation_contact DROP CONSTRAINT FK_2BF75DBDE7A1254A');
        $this->addSql('ALTER TABLE reservation_origine DROP CONSTRAINT FK_729E0DEAB83297E7');
        $this->addSql('ALTER TABLE reservation_origine DROP CONSTRAINT FK_729E0DEA87998E');
        $this->addSql('DROP TABLE reservation_contact');
        $this->addSql('DROP TABLE reservation_origine');
        $this->addSql('ALTER TABLE reservation DROP position');
        $this->addSql('ALTER TABLE reservation DROP paid');
        $this->addSql('ALTER TABLE reservation DROP upsell');
    }
}
