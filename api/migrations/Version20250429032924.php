<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250429032924 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE circuit_qualification (circuit_id INT NOT NULL, qualification_id INT NOT NULL, PRIMARY KEY(circuit_id, qualification_id))');
        $this->addSql('CREATE INDEX IDX_BE455713CF2182C8 ON circuit_qualification (circuit_id)');
        $this->addSql('CREATE INDEX IDX_BE4557131A75EE38 ON circuit_qualification (qualification_id)');
        $this->addSql('ALTER TABLE circuit_qualification ADD CONSTRAINT FK_BE455713CF2182C8 FOREIGN KEY (circuit_id) REFERENCES circuit (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE circuit_qualification ADD CONSTRAINT FK_BE4557131A75EE38 FOREIGN KEY (qualification_id) REFERENCES qualification (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE circuit ADD needs_encadrant BOOLEAN DEFAULT NULL');
        $this->addSql('ALTER TABLE qualification ADD encadrant BOOLEAN DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE circuit_qualification DROP CONSTRAINT FK_BE455713CF2182C8');
        $this->addSql('ALTER TABLE circuit_qualification DROP CONSTRAINT FK_BE4557131A75EE38');
        $this->addSql('DROP TABLE circuit_qualification');
        $this->addSql('ALTER TABLE qualification DROP encadrant');
        $this->addSql('ALTER TABLE circuit DROP needs_encadrant');
    }
}
