<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250825045238 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE carnet_vol ADD type_vol VARCHAR(50) NOT NULL');
        $this->addSql('ALTER TABLE carnet_vol ADD lieux_arrivee JSON DEFAULT NULL');
        $this->addSql('ALTER TABLE carnet_vol DROP type_de_vol');
        $this->addSql('ALTER TABLE carnet_vol DROP lieu_arrivee');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE carnet_vol ADD type_de_vol JSON NOT NULL');
        $this->addSql('ALTER TABLE carnet_vol ADD lieu_arrivee VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE carnet_vol DROP type_vol');
        $this->addSql('ALTER TABLE carnet_vol DROP lieux_arrivee');
    }
}
