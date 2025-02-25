<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20241105051937 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE prestation ADD duree DOUBLE PRECISION DEFAULT NULL');
        $this->addSql('ALTER TABLE prestation ADD horametre_depart DOUBLE PRECISION DEFAULT NULL');
        $this->addSql('ALTER TABLE prestation ADD horametre_fin DOUBLE PRECISION DEFAULT NULL');
        $this->addSql('ALTER TABLE prestation ADD turnover DOUBLE PRECISION DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE prestation DROP duree');
        $this->addSql('ALTER TABLE prestation DROP horametre_depart');
        $this->addSql('ALTER TABLE prestation DROP horametre_fin');
        $this->addSql('ALTER TABLE prestation DROP turnover');
    }
}
