<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250907132715 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE expense DROP montant');
        $this->addSql('ALTER TABLE expense DROP mode');
        $this->addSql('ALTER TABLE payment_detail ADD expense_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE payment_detail ADD CONSTRAINT FK_B3EE405F395DB7B FOREIGN KEY (expense_id) REFERENCES expense (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_B3EE405F395DB7B ON payment_detail (expense_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE expense ADD montant DOUBLE PRECISION DEFAULT NULL');
        $this->addSql('ALTER TABLE expense ADD mode VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE payment_detail DROP CONSTRAINT FK_B3EE405F395DB7B');
        $this->addSql('DROP INDEX IDX_B3EE405F395DB7B');
        $this->addSql('ALTER TABLE payment_detail DROP expense_id');
    }
}
