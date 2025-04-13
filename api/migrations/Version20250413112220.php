<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250413112220 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE cadeau_origine (cadeau_id INT NOT NULL, origine_id INT NOT NULL, PRIMARY KEY(cadeau_id, origine_id))');
        $this->addSql('CREATE INDEX IDX_78C5DC4CD9D5ED84 ON cadeau_origine (cadeau_id)');
        $this->addSql('CREATE INDEX IDX_78C5DC4C87998E ON cadeau_origine (origine_id)');
        $this->addSql('ALTER TABLE cadeau_origine ADD CONSTRAINT FK_78C5DC4CD9D5ED84 FOREIGN KEY (cadeau_id) REFERENCES cadeau (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE cadeau_origine ADD CONSTRAINT FK_78C5DC4C87998E FOREIGN KEY (origine_id) REFERENCES origine (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE cadeau_origine DROP CONSTRAINT FK_78C5DC4CD9D5ED84');
        $this->addSql('ALTER TABLE cadeau_origine DROP CONSTRAINT FK_78C5DC4C87998E');
        $this->addSql('DROP TABLE cadeau_origine');
    }
}
