<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250517063058 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE client ADD website VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE client ADD has_passenger_registration BOOLEAN DEFAULT NULL');
        $this->addSql('ALTER TABLE client ADD has_options BOOLEAN DEFAULT NULL');
        $this->addSql('ALTER TABLE client ADD has_partners BOOLEAN DEFAULT NULL');
        $this->addSql('ALTER TABLE client ADD has_gifts BOOLEAN DEFAULT NULL');
        $this->addSql('ALTER TABLE client ADD thanks_title VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE client ADD thanks_message TEXT DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE client DROP website');
        $this->addSql('ALTER TABLE client DROP has_passenger_registration');
        $this->addSql('ALTER TABLE client DROP has_options');
        $this->addSql('ALTER TABLE client DROP has_partners');
        $this->addSql('ALTER TABLE client DROP has_gifts');
        $this->addSql('ALTER TABLE client DROP thanks_title');
        $this->addSql('ALTER TABLE client DROP thanks_message');
    }
}
