<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250914142134 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE payment_origine (payment_id INT NOT NULL, origine_id INT NOT NULL, PRIMARY KEY(payment_id, origine_id))');
        $this->addSql('CREATE INDEX IDX_C42B8854C3A3BB ON payment_origine (payment_id)');
        $this->addSql('CREATE INDEX IDX_C42B88587998E ON payment_origine (origine_id)');
        $this->addSql('ALTER TABLE payment_origine ADD CONSTRAINT FK_C42B8854C3A3BB FOREIGN KEY (payment_id) REFERENCES payment (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE payment_origine ADD CONSTRAINT FK_C42B88587998E FOREIGN KEY (origine_id) REFERENCES origine (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE origine ADD has_commision BOOLEAN DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE payment_origine DROP CONSTRAINT FK_C42B8854C3A3BB');
        $this->addSql('ALTER TABLE payment_origine DROP CONSTRAINT FK_C42B88587998E');
        $this->addSql('DROP TABLE payment_origine');
        $this->addSql('ALTER TABLE origine DROP has_commision');
    }
}
