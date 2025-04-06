<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250406123144 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE entretien_user (entretien_id INT NOT NULL, user_id UUID NOT NULL, PRIMARY KEY(entretien_id, user_id))');
        $this->addSql('CREATE INDEX IDX_413A58E548DCEA2 ON entretien_user (entretien_id)');
        $this->addSql('CREATE INDEX IDX_413A58EA76ED395 ON entretien_user (user_id)');
        $this->addSql('ALTER TABLE entretien_user ADD CONSTRAINT FK_413A58E548DCEA2 FOREIGN KEY (entretien_id) REFERENCES entretien (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE entretien_user ADD CONSTRAINT FK_413A58EA76ED395 FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE entretien_user DROP CONSTRAINT FK_413A58E548DCEA2');
        $this->addSql('ALTER TABLE entretien_user DROP CONSTRAINT FK_413A58EA76ED395');
        $this->addSql('DROP TABLE entretien_user');
    }
}
