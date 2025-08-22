<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250822165721 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE certificat_medical ADD is_alert_sent BOOLEAN DEFAULT NULL');
        $this->addSql('ALTER TABLE client ADD seuil_medical INT DEFAULT NULL');
        $this->addSql('ALTER TABLE client ADD seuil_qualifications INT DEFAULT NULL');
        $this->addSql('ALTER TABLE pilot_qualification ADD is_alert_sent BOOLEAN DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE pilot_qualification DROP is_alert_sent');
        $this->addSql('ALTER TABLE client DROP seuil_medical');
        $this->addSql('ALTER TABLE client DROP seuil_qualifications');
        $this->addSql('ALTER TABLE certificat_medical DROP is_alert_sent');
    }
}
