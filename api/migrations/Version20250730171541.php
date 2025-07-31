<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250730171541 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE cadeau ADD telephone VARCHAR(20) DEFAULT NULL');
        $this->addSql('ALTER TABLE payment_detail ADD prepayment_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE payment_detail ADD CONSTRAINT FK_B3EE405BB3BD4DA FOREIGN KEY (prepayment_id) REFERENCES cadeau (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_B3EE405BB3BD4DA ON payment_detail (prepayment_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE cadeau DROP telephone');
        $this->addSql('ALTER TABLE payment_detail DROP CONSTRAINT FK_B3EE405BB3BD4DA');
        $this->addSql('DROP INDEX IDX_B3EE405BB3BD4DA');
        $this->addSql('ALTER TABLE payment_detail DROP prepayment_id');
    }
}
