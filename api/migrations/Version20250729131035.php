<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250729131035 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE cadeau ADD quantite INT DEFAULT NULL');
        $this->addSql('ALTER TABLE cadeau ADD date DATE DEFAULT NULL');
        $this->addSql('ALTER TABLE cadeau ADD prix DOUBLE PRECISION DEFAULT NULL');
        $this->addSql('ALTER TABLE cadeau ADD options_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE cadeau ADD CONSTRAINT FK_3D2134603ADB05F1 FOREIGN KEY (options_id) REFERENCES combinaison (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_3D2134603ADB05F1 ON cadeau (options_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE cadeau DROP CONSTRAINT FK_3D2134603ADB05F1');
        $this->addSql('DROP INDEX IDX_3D2134603ADB05F1');
        $this->addSql('ALTER TABLE cadeau DROP quantite');
        $this->addSql('ALTER TABLE cadeau DROP date');
        $this->addSql('ALTER TABLE cadeau DROP prix');
        $this->addSql('ALTER TABLE cadeau DROP options_id');
    }
}
