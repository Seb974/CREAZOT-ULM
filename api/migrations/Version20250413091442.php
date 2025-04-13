<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250413091442 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE cadeau ADD cout DOUBLE PRECISION DEFAULT NULL');
        $this->addSql('ALTER TABLE cadeau ADD circuit_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE cadeau ADD option_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE cadeau ADD CONSTRAINT FK_3D213460CF2182C8 FOREIGN KEY (circuit_id) REFERENCES circuit (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE cadeau ADD CONSTRAINT FK_3D213460A7C41D6F FOREIGN KEY (option_id) REFERENCES option (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_3D213460CF2182C8 ON cadeau (circuit_id)');
        $this->addSql('CREATE INDEX IDX_3D213460A7C41D6F ON cadeau (option_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE cadeau DROP CONSTRAINT FK_3D213460CF2182C8');
        $this->addSql('ALTER TABLE cadeau DROP CONSTRAINT FK_3D213460A7C41D6F');
        $this->addSql('DROP INDEX IDX_3D213460CF2182C8');
        $this->addSql('DROP INDEX IDX_3D213460A7C41D6F');
        $this->addSql('ALTER TABLE cadeau DROP cout');
        $this->addSql('ALTER TABLE cadeau DROP circuit_id');
        $this->addSql('ALTER TABLE cadeau DROP option_id');
    }
}
