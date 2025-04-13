<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250411132929 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE aeronef ADD changement_moteur DOUBLE PRECISION DEFAULT NULL');
        $this->addSql('ALTER TABLE aeronef ADD seuil_alerte_changement_moteur DOUBLE PRECISION DEFAULT NULL');
        $this->addSql('ALTER TABLE aeronef ADD alerte_moteur_envoyee BOOLEAN DEFAULT NULL');
        $this->addSql('ALTER TABLE aeronef ADD code_balise VARCHAR(255) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE aeronef DROP changement_moteur');
        $this->addSql('ALTER TABLE aeronef DROP seuil_alerte_changement_moteur');
        $this->addSql('ALTER TABLE aeronef DROP alerte_moteur_envoyee');
        $this->addSql('ALTER TABLE aeronef DROP code_balise');
    }
}
