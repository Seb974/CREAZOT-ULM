<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250905073048 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE client ADD consent_text TEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE passager ADD consent_accepted BOOLEAN DEFAULT NULL');
        $this->addSql('ALTER TABLE passager ADD consent_text TEXT DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE passager DROP consent_accepted');
        $this->addSql('ALTER TABLE passager DROP consent_text');
        $this->addSql('ALTER TABLE client DROP consent_text');
    }
}
